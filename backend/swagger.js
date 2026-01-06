const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Budget-tracker API",
            version: "1.0.0",
            description: "Budget-tracker API documentation",
        },
    },
    apis: ["./routers/*.js"], 
};

const specs = swaggerJsdoc(options);

module.exports = {
    specs,
    swaggerUi,
};
