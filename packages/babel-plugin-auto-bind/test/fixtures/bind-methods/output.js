class Binder {
  constructor() {
    this.name = "binder";
    this.print = this.print.bind(this);
  }

  print() {
    console.log("name: ", this.name);
  }
}