
const isValidName = value => {
  if (value.indexOf(" ") > -1 || 
    value.indexOf('.') > -1 || 
    value.indexOf('~') > -1 ||
    value.indexOf('^') > -1 ||
    value.indexOf(':') > -1 ||
    value.indexOf('\\') > -1 ||
    value.indexOf('/') > -1) {
    return false
  } else {
    return true 
  }
}

const convertCamelCaseStringToFormattedString = (str) => {
  return str.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")
}

export {
  isValidName,
  convertCamelCaseStringToFormattedString
}