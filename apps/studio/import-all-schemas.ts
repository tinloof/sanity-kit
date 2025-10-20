export default function importAllSchemas() {
  const modules = import.meta.glob("./**/*.ts", {
    eager: true,
    base: "./**/schemas",
  });

  const schemas = Object.values(modules)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((module: any) => {
      // Handle both default exports and named exports
      const schema = module.default || module;

      console.log(schema);

      // If the module exports a function, call it
      if (typeof schema === "function") {
        return schema();
      }

      return schema;
    })
    .filter(Boolean);

  return schemas;
}
