const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const convert = require("xml-js");
const express = require("express");

fs.readFile("./testing.log", "utf8", (err, res) => {
  try {
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
    const { payload } = github.context;
    // console.log(payload);

    var payloadText = {
        username: payload.head_commit.author.username,
        project_name: payload.repository.full_name,
      };
    // hasil.about = payloadText;

    var success = true;

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

      if (test.result == "error") {
        success = false;
      }
  
      // hasil.test = test;
      hasil.push(test);
    });
  
    var output = {
      about: payloadText,
      test: {
        success: success,
        tests: hasil
      }
    }

    console.log(JSON.stringify(output));
  } catch (error) {
    core.setFailed(error);
    console.log(error);
  }
});