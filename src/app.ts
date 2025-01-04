//autobind method-based decorator. there are property and class based method decorators.
function autoBind(target:any, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor{
    const originalFn = descriptor.value;
    const adjDescriptor: PropertyDescriptor = { configurable: true, get(){ const boundFn = originalFn.bind(this); return boundFn;}};
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

    constructor(){
      this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
      this.hostElement = <HTMLDivElement>document.getElementById('app')!;
      const importedNode = document.importNode(this.templateElement.content, true);
      this.formElement = <HTMLFormElement>importedNode.firstElementChild;
      this.formElement.id = 'user-input';

      this.titleInputElement = <HTMLInputElement>this.formElement.querySelector('#title');
      this.descriptionInputElement = <HTMLInputElement>this.formElement.querySelector('#description');
      this.peopleInputElement = <HTMLInputElement>this.formElement.querySelector('#people');
      this.configure();
      this.attach();
    }

    private gatherUserInput():[string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        if(enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
            alert('please try again because you entered an invalid input');
            return;
        }else{
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs(){
        this.titleInputElement.value='';
        this.descriptionInputElement.value='';
        this.peopleInputElement.value='';
    }

    @autoBind
    private formSubmitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            this.clearInputs();
            
        }
    }
    private configure(){
        this.formElement.addEventListener('submit', this.formSubmitHandler.bind(this));
    }
    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const prjInput = new ProjectInput();