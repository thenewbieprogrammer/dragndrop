In this project ive utilised a function which checks the dom every single time, however if this was for production it would not be performant / efficient so a cached List would solve the issue here.. see below...


    class CachedList {
    private ulElement: HTMLUListElement;
    private cache: Set<string>;

    constructor(ulElement: HTMLUListElement) {
        this.ulElement = ulElement;
        this.cache = new Set<string>();
        this.refreshCache();
    }

    // Refresh the cache based on current child nodes
    private refreshCache(): void {
        this.cache.clear();
        this.ulElement.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const textContent = element.textContent?.trim();
                if (textContent) {
                    this.cache.add(textContent);
                }
            }
        });
    }

    // Check if none of the forbidden values exist in the cached values
    public areProhibitedValuesAbsent(values: string[]): boolean {
        for (const value of values) {
            if (this.cache.has(value)) {
                return false; // At least one prohibited value exists
            }
        }
        return true; // All prohibited values are absent
    }

    // Optionally add a method to update the list and refresh the cache
    public addItem(text: string): void {
        const li = document.createElement('li');
        li.textContent = text;
        this.ulElement.appendChild(li);
        this.cache.add(text);
    }

    public removeItem(text: string): void {
        const liElements = this.ulElement.getElementsByTagName('li');
        for (let i = 0; i < liElements.length; i++) {
            if (liElements[i].textContent?.trim() === text) {
                this.ulElement.removeChild(liElements[i]);
                this.cache.delete(text);
                break;
            }
        }
    }
    }

// Usage
const ulElement = document.getElementById('myList') as HTMLUListElement; // Replace with your <ul> element selector
const myCachedList = new CachedList(ulElement);
const prohibitedValues = ['Testing', 'Testing 2'];

if (myCachedList.areProhibitedValuesAbsent(prohibitedValues)) {
    console.log('None of the prohibited values exist in the child nodes.');
} else {
    console.log('At least one of the prohibited values exists in the child nodes.');
}

// Example to add or remove items
myCachedList.addItem('New Item');
myCachedList.removeItem('Testing');
Explanation of the Caching Strategy
CachedList Class: This class encapsulates the logic for managing a cached list of items. It takes an HTMLUListElement as a parameter.
Cache Initialization: When the class is initialized, it populates the cache by iterating through the current child nodes and adding their text content to a Set.
Cache Refreshing: The refreshCache method can be called to clear and update the cache whenever needed (like after adding/removing items).
Check Against Cache: The method areProhibitedValuesAbsent checks prohibited values against the cached set, making it efficient.
Adding and Removing Items: The class includes addItem and removeItem methods to manipulate the list. Whenever an item is added or removed, the cache is updated accordingly.
Performance Benefit
By caching the child nodes' text contents, subsequent checks against prohibited values become much quicker (O(1) lookups), as you avoid repeatedly querying the DOM.
Whenever changes occur in the list, you refresh the cache to reflect the current state without any impact on performance.
This structure provides a clear and efficient way to handle your use case, allowing for quick access to text values that should be monitored.
