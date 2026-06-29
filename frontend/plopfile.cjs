module.exports = function (plop) {
  plop.setGenerator("component", {
    description: "Create a React component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.jsx",
        template: `
import "./{{pascalCase name}}.css";

const {{pascalCase name}} = () => {
  return (
    <div className="{{kebabCase name}}">
      {{pascalCase name}}
    </div>
  );
};

export default {{pascalCase name}};
`,
      },
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.css",
        template: `
.{{kebabCase name}} {
}
`,
      },
    ],
  });
};
