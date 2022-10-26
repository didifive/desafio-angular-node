import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateCpfCnpj', async: false })
export class ValidateCpfCnpj implements ValidatorConstraintInterface {
  validate(cpfCnpj: string, args: ValidationArguments) {
    const requestPersonDto: any = args.object;
    const personType = requestPersonDto.personType;
    if (personType === 'F') return this.validateCpf(cpfCnpj);
    if (personType === 'J') return this.validateCnpj(cpfCnpj);
    return false;
  }

  defaultMessage() {
    return 'CPF/CNPJ inválido!';
  }

  validateCpf(cpf: string) {
    let sum = 0;
    if (cpf === undefined) return false;
    if (
      cpf === '00000000000' ||
      cpf === '11111111111' ||
      cpf === '22222222222' ||
      cpf === '33333333333' ||
      cpf === '44444444444' ||
      cpf === '55555555555' ||
      cpf === '66666666666' ||
      cpf === '77777777777' ||
      cpf === '88888888888' ||
      cpf === '99999999999' ||
      cpf.length !== 11
    ) {
      return false;
    }

    for (let i = 1; i <= 9; i++)
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let k = 1; k <= 10; k++)
      sum += parseInt(cpf.substring(k - 1, k)) * (12 - k);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  validateCnpj(cnpj: string) {
    if (cnpj === undefined) return false;
    if (
      cnpj === '00000000000000' ||
      cnpj === '11111111111111' ||
      cnpj === '22222222222222' ||
      cnpj === '33333333333333' ||
      cnpj === '44444444444444' ||
      cnpj === '55555555555555' ||
      cnpj === '66666666666666' ||
      cnpj === '77777777777777' ||
      cnpj === '88888888888888' ||
      cnpj === '99999999999999' ||
      cnpj.length !== 14
    ) {
      return false;
    }

    let size = cnpj.length - 2;
    const digits = cnpj.substring(size);
    let numbers = cnpj.substring(0, size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) {
      return false;
    }

    size++;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let k = size; k >= 1; k--) {
      sum += parseInt(numbers.charAt(size - k)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
}
