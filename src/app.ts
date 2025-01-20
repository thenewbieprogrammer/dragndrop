//Drag & Drop Interfaces
interface DraggableComponent {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

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

//utility function: check if child node exists that contains a specific string value
function isChildRenderedMatchingValue(
  parentElement: HTMLElement,
  value: string,
): boolean {
  const childNodes = parentElement.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.textContent?.trim() === value) {
        return true; // match found
      }
    }
  }
  return false; //no match found
}

//project state mgmt

type Listener<T> = (items: T[]) => void;
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(fn: Listener<T>) {
    this.listeners.push(fn);
  }
}
class ProjectState extends State<Project> {
  private static instance: ProjectState;
  private projects: Project[] = [];

  private constructor() {
    super();
  }
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addListener(listenerFn: Listener<Project>) {
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
    this.updateListeners();
  }
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
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
    isValid = isValid && input.value >= input.minimumNumber;
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

//project-component base-class
abstract class ProjectComponent<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  formElement: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)!
    );
    this.hostElement = <T>document.getElementById(hostElementId)!;
    const importedNode = document.importNode(
      this.templateElement.content,
      true,
    );
    this.formElement = <U>importedNode.firstElementChild;
    if (newElementId) this.formElement.id = newElementId;
    this.attach(insertAtStart);
  }

  abstract configure(): void;

  abstract renderContent(): void;

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.formElement,
    );
  }
}

//projectInput class
class ProjectInput extends ProjectComponent<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
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
  }

  configure() {
    this.formElement.addEventListener("submit", this.formSubmitHandler);
  }
  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidation: FormValidation = {
      value: enteredTitle,
      required: true,
      minCharLength: 2,
      maxCharLength: 50,
    };
    const descriptionValidation: FormValidation = {
      value: enteredDescription,
      required: true,
      minCharLength: 5,
      maxCharLength: 50,
    };
    const peopleValidation: FormValidation = {
      value: +enteredPeople,
      required: true,
      minimumNumber: 1,
      maximumNumber: 15,
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
}

//projectItem class
class ProjectItem
  extends ProjectComponent<HTMLUListElement, HTMLLIElement>
  implements DraggableComponent
{
  private project: Project;

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  get people() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} people`;
    }
  }

  configure() {
    this.formElement.addEventListener("dragstart", this.dragStartHandler);
    this.formElement.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent() {
    this.formElement.querySelector("h2")!.textContent = this.project.title;
    this.formElement.querySelector("h3")!.textContent =
      this.people + " assigned";
    this.formElement.querySelector("p")!.textContent = this.project.description;
  }

  @autoBind
  dragEndHandler(_: DragEvent): void {
    console.log("drag end hndlr");
  }

  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }
}

//projectList class
class ProjectList
  extends ProjectComponent<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }
  configure(): void {
    this.formElement.addEventListener("dragover", this.dragOverHandler);
    this.formElement.addEventListener("dragleave", this.dragLeaveHandler);
    this.formElement.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.formElement.querySelector("ul")!.id = listId;
    this.formElement.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  @autoBind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.formElement.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.formElement.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished,
    );
  }

  private renderProjects() {
    const listElement = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)!
    );
    listElement.innerHTML = "";
    for (const project of this.assignedProjects) {
      new ProjectItem(this.formElement.querySelector("ul")!.id, project);
    }
  }
}

const prjInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const doneProjectList = new ProjectList("finished");
