import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Mínimo 6 caracteres
          if (value.length < 6) return false;

          // Pelo menos uma letra e um número
          const hasLetter = /[a-zA-Z]/.test(value);
          const hasNumber = /[0-9]/.test(value);

          return hasLetter && hasNumber;
        },
        defaultMessage(args: ValidationArguments) {
          return 'A senha deve conter pelo menos 6 caracteres, incluindo letras e números';
        },
      },
    });
  };
}
