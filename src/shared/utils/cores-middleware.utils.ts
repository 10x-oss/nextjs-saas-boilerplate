// Helper method to wait for a middleware to execute before continuing
// And to throw an error if anything goes wrong
const coresMiddleware = (middleware: any) => (req: any, res: any) =>
  new Promise((resolve, reject) => {
    middleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export default coresMiddleware;
