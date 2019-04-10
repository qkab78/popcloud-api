const config = require("../config");
const mongoose = require("./mongoose-service");
const cors = require("@koa/cors");
exports.start = (app, router, port) => {
  require("../api/routes/")(router);

  app.use(cors());
  app.use(require("koa-body")());
  app.use(require("koa-respond")());

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // will only respond with JSON
      console.error("error during request: ", err);
      ctx.internalServerError();
    }
  });

  app.use(router.allowedMethods());
  app.use(router.routes());

  //Connect to database
  if (config.DBURI) {
    mongoose.connect(config.DBURI);
  }

  if (!port) port = 8080;
  app.listen(port, () => console.log("Server running on port: " + port));
  return app;
};
