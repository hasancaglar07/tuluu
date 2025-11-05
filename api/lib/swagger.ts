import { createSwaggerSpec } from "next-swagger-doc";
import swaggerJSDoc from "swagger-jsdoc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "TULU API Documentation",
        version: "1.0",
        license: {
          name: "Licence EULA",
          url: "https://github.com/sylvaincodes/tulu/blob/main/LICENCE.md",
        },
        servers: "https://tuluu.vercel.app",
        contact: {
          email: "syvlaincodeur@gmail.com",
          title: " Sylvain Codes",
          url: "https://www.patreon.com/sylvaincodes",
        },
      },
      servers: [
        {
          url: "https://tuluu.vercel.app",
          description: "Production Environment",
        },
        {
          url: "http://localhost:3001",
          description: "Test local Environment",
        },
      ],

      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
  });
  return spec;
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TULU API Documentation",
      version: "1.0",
      license: {
        name: "Licence EULA",
        url: "https://github.com/sylvaincodes/tulu/blob/main/LICENCE.md",
      },
      servers: "https://tuluu.vercel.app",
      contact: {
        email: "syvlaincodeur@gmail.com",
        title: " Sylvain Codes",
        url: "https://www.patreon.com/sylvaincodes",
      },
    },
    servers: [
      {
        url: "https://tuluu.vercel.app",
        description: "Production Environment",
      },
      {
        url: "http://localhost:3001",
        description: "Test local Environment",
      },
    ],
    components: {
      securitySchemes: {
        clerkAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./app/api/**/*.ts"], // path where your routes live
};

export const swaggerSpec = swaggerJSDoc(options);
