function Logger(constructor) {
  console.log("Logger...")
  console.log(constructor)
}

function Printer(constructor) {
  console.log("Printer...")
}

function normalFunction() {
console.log("normal func")
}

@Logger
normalFunction()