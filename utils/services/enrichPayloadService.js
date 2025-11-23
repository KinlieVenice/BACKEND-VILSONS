const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const enrichPayloadWithNames = async (payload, mappings) => {
  const enrichedPayload = JSON.parse(JSON.stringify(payload));

  const collectIds = (obj, currentPath = "") => {
    const collectedIds = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;

      const mapping = mappings[key];
      if (mapping) {
        if (Array.isArray(value)) {
          collectedIds.push({
            path: fullPath,
            ids: value,
            mapping,
            type: "array",
          });
        } else if (typeof value === "string") {
          collectedIds.push({
            path: fullPath,
            ids: [value],
            mapping,
            type: "single",
          });
        }
      } else if (typeof value === "object" && value !== null) {
        collectedIds.push(...collectIds(value, fullPath));
      }
    }

    return collectedIds;
  };

  const allCollectedIds = collectIds(enrichedPayload);

  const idMap = new Map();
  allCollectedIds.forEach(({ ids, mapping }) => {
    if (!idMap.has(mapping.model)) {
      idMap.set(mapping.model, new Set());
    }
    ids.forEach((id) => idMap.get(mapping.model).add(id));
  });

  const fetchPromises = [];
  const modelConfigs = new Map();

  for (const [model, idSet] of idMap) {
    if (idSet.size > 0) {
      const config = Object.values(mappings).find((m) => m.model === model);
      if (config) {
        modelConfigs.set(model, config);

        if (
          config.specialLookup &&
          config.specialLookup.type === "userRelation"
        ) {
          // For employee/contractor/customer -> user relation
          fetchPromises.push(
            prisma[model]
              .findMany({
                where: { id: { in: Array.from(idSet) } },
                include: {
                  user: {
                    select: { fullName: true },
                  },
                },
              })
              .then((results) => ({
                model,
                results,
                specialLookup: config.specialLookup,
              }))
          );
        } else {
          // Normal lookup
          fetchPromises.push(
            prisma[model]
              .findMany({
                where: { id: { in: Array.from(idSet) } },
                select: { id: true, [config.nameField]: true },
              })
              .then((results) => ({ model, results }))
          );
        }
      }
    }
  }

  const fetchedData = await Promise.all(fetchPromises);

  const modelMaps = new Map();
  fetchedData.forEach(({ model, results, specialLookup }) => {
    const config = modelConfigs.get(model);
    if (config) {
      if (specialLookup && specialLookup.type === "userRelation") {
        // For employee -> user.fullName
        modelMaps.set(
          model,
          new Map(results.map((item) => [item.id, item.user?.fullName || null]))
        );
      } else {
        // Normal case
        modelMaps.set(
          model,
          new Map(results.map((item) => [item.id, item[config.nameField]]))
        );
      }
    }
  });

  const updateWithNames = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      const mapping = mappings[key];

      if (mapping) {
        const nameMap = modelMaps.get(mapping.model);

        if (nameMap) {
          if (Array.isArray(value)) {
            const nameField = `${key.replace(/s$/, "")}Names`;
            obj[nameField] = value.map((id) => nameMap.get(id) || null);
            delete obj[key];
          } else if (typeof value === "string") {
            const nameField = `${key.replace("Id", "Name")}`;
            obj[nameField] = nameMap.get(value) || null;
            delete obj[key];
          }
        }
      } else if (typeof value === "object" && value !== null) {
        updateWithNames(value);
      }
    }
  };

  updateWithNames(enrichedPayload);

  return enrichedPayload;
};

module.exports = { enrichPayloadWithNames };