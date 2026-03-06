function validateTask(title, description, column) {

 if(!title || title.length > 255)
  throw new Error("Invalid title");

 if(!column)
  throw new Error("Column required");

}

module.exports = {
 validateTask
};