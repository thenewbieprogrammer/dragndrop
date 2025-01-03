class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    formElement: HTMLFormElement;

    constructor(){
      this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
      this.hostElement = <HTMLDivElement>document.getElementById('app')!;
      const importedNode = document.importNode(this.templateElement.content, true);
      this.formElement = <HTMLFormElement>importedNode.firstElementChild;
      this.attach();
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const prjInput = new ProjectInput();