function getEnvValue(envName) {
  const key = process.env.NODE_ENV
    ? `${envName}_${process.env.NODE_ENV}`.trim()
    : `${envName}_DEV`;
  return process.env[key];
}

module.exports = {
  AWS_KEY: getEnvValue("AWS_KEY"),
  AWS_SECRET: getEnvValue("AWS_SECRET"),
  AWS_REGION: getEnvValue("AWS_REGION"),
  AWS_API_VERSION: getEnvValue("AWS_API_VERSION"),
  AWS_AMI: getEnvValue("AWS_AMI"),
  DBURI: getEnvValue("DBURI"),
  PORT: getEnvValue("PORT"),
  JWTSECRET: getEnvValue("JWTSECRET"),
  SALT: getEnvValue("SALT")
};
