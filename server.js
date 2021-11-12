//server listen
const app = require("./index");

if (process.env.NODE_ENV !== 'test') {
    app.listen(8888, () => {
        console.log(`Server is running on port: ${8888}`);
    });
}else{
  app.listen(() => {
      console.log(`Test Server is running on default port: ` + server.address().port);
  });
}
