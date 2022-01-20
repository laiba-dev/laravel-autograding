const fs = require("fs");
const convert = require("xml-js");

fs.readFile("./testing.log", "utf8", (err, res) => {
  var result = convert.xml2json(res, { compact: false, spaces: 4 });
  var data = JSON.parse(result);

  const goInside = (data) => {
    var current = data.elements[0];
    while (current.elements[0].name !== "testcase") {
      current = current.elements[0];
    }
    return current.elements;
  };
  var testCases = goInside(data);

  var hasil = [];

  testCases.forEach((testData) => {
    var test = {};
    test.name = testData.attributes.name;
    if (typeof testData.elements !== "undefined") {
      test.result = "error";
      var failure = testData.elements[0].elements[0].text;

      var failureRow = failure.split("\n");
      test.message = failureRow[1];
    } else {
      test.result = "success";
      test.message = null;
    }

    hasil.push(test);
  });

  console.log(JSON.stringify(hasil));
});
