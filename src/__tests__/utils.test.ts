import { generateStructuredDataTypes } from "../utils";

describe("Utilities Tests", () => {
  it("Should support primitive types", () => {
    const jsonLddocument = {
      "@type": "Person",
      firstName: "Jane",
      index: 0,
      valid: true,
    };

    const output = generateStructuredDataTypes(jsonLddocument);

    expect(output).toEqual({
      Document: [
        { name: "@type", type: "string" },
        { name: "firstName", type: "string" },
        { name: "index", type: "uint256" },
        { name: "valid", type: "bool" },
      ],
    });
  });

  it("Should support arrays", () => {
    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      firstName: "Jane",
      lastName: "Does",
      jobTitle: "Professor",
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    const output = generateStructuredDataTypes(jsonLdDocument);

    expect(output).toEqual({
      Document: [
        { name: "@context", type: "string[]" },
        { name: "@type", type: "string" },
        { name: "email", type: "string" },
        { name: "firstName", type: "string" },
        { name: "jobTitle", type: "string" },
        { name: "lastName", type: "string" },
        { name: "telephone", type: "string" },
      ],
    });
  });

  it("Should support nested data", () => {
    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      name: {
        first: "Jane",
        last: "Doe",
      },
      otherData: {
        jobTitle: "Professor",
        school: "University of ExampleLand",
      },
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    const output = generateStructuredDataTypes(jsonLdDocument);

    expect(output).toEqual({
      Document: [
        { name: "@context", type: "string[]" },
        { name: "@type", type: "string" },
        { name: "email", type: "string" },
        { name: "name", type: "Name" },
        { name: "otherData", type: "OtherData" },
        { name: "telephone", type: "string" },
      ],
      Name: [
        { name: "first", type: "string" },
        { name: "last", type: "string" },
      ],
      OtherData: [
        { name: "jobTitle", type: "string" },
        { name: "school", type: "string" },
      ],
    });
  });

  it("Should support multi level nested data", () => {
    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      data: {
        name: {
          first: "Jane",
          last: "Doe",
        },
        otherData: {
          jobTitle: "Professor",
          school: "University of ExampleLand",
        },
      },
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    const output = generateStructuredDataTypes(jsonLdDocument);

    expect(output).toEqual({
      Data: [
        { name: "name", type: "Name" },
        { name: "otherData", type: "OtherData" },
      ],
      Document: [
        { name: "@context", type: "string[]" },
        { name: "@type", type: "string" },
        { name: "data", type: "Data" },
        { name: "email", type: "string" },
        { name: "telephone", type: "string" },
      ],
      Name: [
        { name: "first", type: "string" },
        { name: "last", type: "string" },
      ],
      OtherData: [
        { name: "jobTitle", type: "string" },
        { name: "school", type: "string" },
      ],
    });
  });

  it("Should support repeated structs with same name", () => {
    const document = {
      a: {
        foo: {
          hello: "world",
        },
      },
      b: {
        foo: {
          hello: "world",
        },
      },
    };

    const output = generateStructuredDataTypes(document);

    expect(output).toEqual({
      A: [{ name: "foo", type: "Foo" }],
      Foo: [{ name: "hello", type: "string" }],
      B: [{ name: "foo", type: "Foo" }],
      Document: [
        { name: "a", type: "A" },
        { name: "b", type: "B" },
      ],
    });
  });

  // it.only("should support repeated structs with different names", () => {
  //   const content = {
  //     a: {
  //       hello: "world",
  //     },
  //     b: {
  //       hello: "world",
  //     },
  //   };

  //   const content2 = {
  //     foo: {
  //       foo: {
  //         foo: "bar",
  //       },
  //     },
  //   };

  //   const output = generateStructuredDataTypes(content);
  //   const output2 = generateStructuredDataTypes(content2);

  //   console.log(output);
  //   console.log(output2);
  // });

  it("Should not support mixed arrays", () => {
    const jsonLdDocument = {
      "@context": ["https://schema.org", 1, true],
      firstName: "Jane",
    };

    expect(() => {
      generateStructuredDataTypes(jsonLdDocument);
    }).toThrowError("Arrays of mixed types are not supported");
  });
});
