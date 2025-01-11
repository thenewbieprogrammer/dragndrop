//enums
enum ProjectStatus {
  Active,
  Finished,
}
//project type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}

//project state mgmt

type Listener = (projects: Project[]) => void;
class ProjectState {
  private static instance: ProjectState;
  private listeners: Listener[] = [];
  private projects: Project[] = [];

  private constructor() {}
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }
  addProject(title: string, description: string, numberOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numberOfPeople,
      ProjectStatus.Active,
    );
    this.projects.push(newProject);
    for (const fn of this.listeners) {
      fn(this.projects.slice());
    }
  }
}
//global constant singleton
const projectState = ProjectState.getInstance();

interface FormValidation {
  value: string | number;
  required?: boolean;
  minCharLength?: number;
  maxCharLength?: number;
  minimumNumber?: number;
  maximumNumber?: number;
}

function validateFormInputValues(input: FormValidation) {
  let isValid = true;
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0;
  }
  if (input.minCharLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length > input.minCharLength;
  }
  if (input.maxCharLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length < input.maxCharLength;
  }
  if (input.minimumNumber != null && typeof input.value === "number") {
    isValid = isValid && input.value > input.minimumNumber;
  }
  if (input.maximumNumber != null && typeof input.value === "number") {
    isValid = isValid && input.value < input.maximumNumber;
  }

  return isValid;
}

//autobind method-based decorator. there are property and class based method decorators.
function autoBind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalFn = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalFn.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
//projectInput class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  formElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-input")!
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app")!;
    const importedNode = document.importNode(
      this.templateElement.content,
      true,
    );
    this.formElement = <HTMLFormElement>importedNode.firstElementChild;
    this.formElement.id = "user-input";

    this.titleInputElement = <HTMLInputElement>(
      this.formElement.querySelector("#title")
    );
    this.descriptionInputElement = <HTMLInputElement>(
      this.formElement.querySelector("#description")
    );
    this.peopleInputElement = <HTMLInputElement>(
      this.formElement.querySelector("#people")
    );
    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidation: FormValidation = {
      value: enteredTitle,
      required: true,
      minCharLength: 2,
    };
    const descriptionValidation: FormValidation = {
      value: enteredDescription,
      required: true,
      minCharLength: 5,
    };
    const peopleValidation: FormValidation = {
      value: +enteredPeople,
      required: true,
      minimumNumber: 1,
      maximumNumber: 5,
    };
    if (
      !validateFormInputValues(titleValidation) ||
      !validateFormInputValues(descriptionValidation) ||
      !validateFormInputValues(peopleValidation)
    ) {
      alert("please try again because you entered an invalid input");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autoBind
  private formSubmitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
  private configure() {
    this.formElement.addEventListener("submit", this.formSubmitHandler);
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }
}

//projectList class

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  formElement: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-list")!
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app")!;
    this.assignedProjects = [];
    const importedNode = document.importNode(
      this.templateElement.content,
      true,
    );
    this.formElement = <HTMLElement>importedNode.firstElementChild;
    this.formElement.id = `${this.type}-projects`;
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listElement = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)!
    );
    for (const project of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = project.title;
      listElement.appendChild(listItem);
    }
  }
  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.formElement.querySelector("ul")!.id = listId;
    this.formElement.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }
}

const prjInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const doneProjectList = new ProjectList("finished");
