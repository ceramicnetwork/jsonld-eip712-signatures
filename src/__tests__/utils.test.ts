import { c14nDocumentToEip712StructuredDataTypes } from "../utils";

describe.only("Utilities Tests", () => {
  it("Should support primitive types", () => {
    const jsonLddocument = {
      "@type": "Person",
      firstName: "Jane",
      index: 0,
      valid: true,
    };

    const output = c14nDocumentToEip712StructuredDataTypes(jsonLddocument);

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

    const output = c14nDocumentToEip712StructuredDataTypes(jsonLdDocument);

    expect(output).toEqual({
      Document: [
        { name: "@context", type: "string[]" },
        { name: "@type", type: "string" },
        { name: "firstName", type: "string" },
        { name: "lastName", type: "string" },
        { name: "jobTitle", type: "string" },
        { name: "telephone", type: "string" },
        { name: "email", type: "string" },
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

    const output = c14nDocumentToEip712StructuredDataTypes(jsonLdDocument);

    expect(output).toEqual({
      Name: [
        { name: "first", type: "string" },
        { name: "last", type: "string" },
      ],
      OtherData: [
        { name: "jobTitle", type: "string" },
        { name: "school", type: "string" },
      ],
      Document: [
        { name: "@context", type: "string[]" },
        { name: "@type", type: "string" },
        { name: "name", type: "Name" },
        { name: "otherData", type: "OtherData" },
        { name: "telephone", type: "string" },
        { name: "email", type: "string" },
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

    const output = c14nDocumentToEip712StructuredDataTypes(jsonLdDocument);

    expect(output).toEqual({
      Data: [
        { name: "name", type: "Name" },
        { name: "otherData", type: "OtherData" },
      ],
      Name: [
        { name: "first", type: "string" },
        { name: "last", type: "string" },
      ],
      OtherData: [
        { name: "jobTitle", type: "string" },
        { name: "school", type: "string" },
      ],
      Document: [
        { name: "@context", type: "string[]" },
        { name: "@type", type: "string" },
        { name: "data", type: "Data" },
        { name: "telephone", type: "string" },
        { name: "email", type: "string" },
      ],
    });
  });

  it("Should not support mixed arrays", () => {
    const jsonLdDocument = {
      "@context": ["https://schema.org", 1, true],
      firstName: "Jane",
    };

    expect(() => {
      c14nDocumentToEip712StructuredDataTypes(jsonLdDocument);
    }).toThrowError("Array of mixed types are not supported");
  });
});
