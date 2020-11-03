/**
 * @jest-environment node
 */

 /**
  * @description              This is api testing for ProjectsHub component
  * @version                  1.0
  * @author                   Gerdes
  * @createdBy                Khoa
  */


// This is backend_api which we are gonna test  
const backend_api = require("src/boot/backend-api").default;

// This is value field which response data should have got
const fields = require("test/jest/__mocks__/ProjectsHub.json").api_testing.fields;
const keys = Object.keys(fields);
// testing cases
describe("backend_api testing getProjects()", () => {
  it("must be returned the correct result for projects", async () => {
    // Get response from server and verify
    const response = await backend_api.getProjects();

    // resonse object and its data should be defined
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBeTruthy();

    // each project info's fields should be correct in type
    response.data.forEach(element => {
      // ensure that all required fields are defined
      expect(Object.keys(element)).toEqual(expect.arrayContaining(keys));
      
      // see if each field's type is correct
      keys.forEach(key => {
        if(element[key] == null && key == "image") 
          return;
        if(fields[key] == "array")
          expect(Array.isArray(element[key])).toBeTruthy()
        else
          expect(typeof(element[key])).toBe(fields[key]);
      })
    });
  });
});
