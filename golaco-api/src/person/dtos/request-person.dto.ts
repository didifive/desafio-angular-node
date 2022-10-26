import { IsEmail, IsIn, IsOptional, Length, Validate } from 'class-validator';
import { ValidateCpfCnpj } from '../../utils/validate-cpf-cnpj';

const nameValidationMessage =
  'O nome deve conter no mínimo 3 e máximo de 255 caracteres';
const personTypeValidationMessage =
  'O tipo de pessoa deve ser F para física ou J para jurídica';
const cpfCnpjValidationMessage =
  'O CPF/CNPJ deve ser válido conforme tipo de pessoa física ou jurídica';
const emailValidationMessage = 'O email deve conter um email válido';
const phoneValidationMessage =
  'O telefone  deve conter no mínimo 10 e máximo de 255 caracteres';
const streetValidationMessage =
  'O endereço deve conter no mínimo 3 e máximo de 255 caracteres';
const cityValidationMessage =
  'A cidade deve conter no mínimo 3 e máximo de 255 caracteres';
const stateValidationMessage =
  'O estado deve possuir apenas 2 caracteres representando a UF do mesmo, use EX para exterior';
const postalCodeValidationMessage = 'O CEP deve possuir 8 caracteres';
const countryValidationMessage =
  'O país deve conter no mínimo 3 e máximo de 255 caracteres';

export class RequestPersonDto {
  @Length(3, 255, {
    message: nameValidationMessage,
  })
  name: string;

  @IsIn(['F', 'J'], { message: personTypeValidationMessage })
  personType: string;

  @Validate(ValidateCpfCnpj, {
    message: cpfCnpjValidationMessage,
  })
  cpfCnpj: string;

  @IsEmail({ message: emailValidationMessage })
  email: string;

  @Length(10, 255, {
    message: phoneValidationMessage,
  })
  phone: string;

  @IsOptional()
  @Length(3, 255, {
    message: streetValidationMessage,
  })
  street?: string;

  @IsOptional()
  @Length(3, 255, {
    message: cityValidationMessage,
  })
  city?: string;

  @IsOptional()
  @IsIn(
    [
      'AC',
      'AL',
      'AM',
      'AP',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MG',
      'MS',
      'MT',
      'PA',
      'PB',
      'PE',
      'PI',
      'PR',
      'RJ',
      'RN',
      'RO',
      'RR',
      'RS',
      'SC',
      'SE',
      'SP',
      'TO',
      'EX',
    ],
    { message: stateValidationMessage },
  )
  state?: string;

  @IsOptional()
  @Length(8, 8, {
    message: postalCodeValidationMessage,
  })
  postalCode?: string;

  @IsOptional()
  @Length(3, 255, {
    message: countryValidationMessage,
  })
  country?: string;
}
