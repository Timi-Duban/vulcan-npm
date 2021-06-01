import React from "react";
// TODO: should be loaded from Components instead?
import { FormComponent, FormComponentProps } from "../FormComponent";
import { FormContext } from "../FormContext";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";

// helpers
// tests
describe("vulcan-forms/FormComponent", function () {
  /**
   * Simulate context created by <Form>
   * @param param0
   * @returns
   */
  const wrapper = ({ children }) => (
    // @ts-ignore
    <FormContext.Provider value={{ getDocument: () => ({}) }}>
      {children}
    </FormContext.Provider>
  );
  const defaultProps: FormComponentProps = {
    type: "",
    disabled: false,
    optional: true,
    document: {},
    name: "meetingPlace",
    path: "meetingPlace",
    datatype: [{ type: Object }],
    layout: "horizontal",
    label: "Meeting place",
    currentValues: {},
    formType: "new",
    deletedValues: [],
    throwError: () => {},
    updateCurrentValues: () => {},
    errors: [],
    clearFieldErrors: () => {},
  };
  it("shallow render", function () {
    const { container } = render(<FormComponent {...defaultProps} />, {
      wrapper,
    });
    expect(container).toBeDefined();
  });
  describe("array of objects", function () {
    const props = {
      ...defaultProps,
      datatype: [{ type: Array }],
      nestedSchema: {
        street: {},
        country: {},
        zipCode: {},
      },
      nestedInput: true,
      nestedFields: [{}, {}, {}],
      currentValues: {},
    };
    it("render a FormNestedArray", function () {
      const container = render(<FormComponent {...props} />, { wrapper });
      /*
      const formNested = wrapper.find("FormNestedArray");
      expect(formNested).toHaveLength(1);
      */
    });
  });
  describe("nested object", function () {
    const props = {
      ...defaultProps,
      datatype: [{ type: {} }],
      nestedSchema: {
        street: {},
        country: {},
        zipCode: {},
      },
      nestedInput: true,
      nestedFields: [{}, {}, {}],
      currentValues: {},
    };
    it("shallow render", function () {
      const container = render(<FormComponent {...props} />, { wrapper });
      expect(container).toBeDefined();
    });
    it.skip("render a FormNestedObject", function () {
      /*
      const wrapper = render(<FormComponent {...props} />);
      const formNested = wrapper.find("FormNestedObject");
      expect(formNested).toHaveLength(1);
      */
    });
  });
  describe("array of custom inputs (e.g url)", function () {
    it("shallow render", function () {});
  });
});
