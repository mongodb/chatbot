#include <stdio.h>
#include <stdlib.h>

float add(float num1, float num2) { return num1 + num2; }

float subtract(float num1, float num2) { return num1 - num2; }

float multiply(float num1, float num2) { return num1 * num2; }

float divide(float num1, float num2) {
  if (num2 != 0.0) {
    return num1 / num2;
  } else {
    printf("Error: Division by zero!\n");
    return 0.0;
  }
}

int main() {
  char operator;
  float num1, num2, result;

  printf("Enter an operator (+, -, *, /): ");
  scanf(" %c", &operator);

  printf("Enter two operands: ");
  scanf("%f %f", &num1, &num2);

  switch (operator) {
  case '+':
    result = add(num1, num2);
    break;
  case '-':
    result = subtract(num1, num2);
    break;
  case '*':
    result = multiply(num1, num2);
    break;
  case '/':
    result = divide(num1, num2);
    break;
  default:
    printf("Error: Unsupported operation!\n");
    return -1;
  }

  printf("Result: %.2f\n", result);
  return 0;
}
