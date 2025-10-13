import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export function IsEnumX(
  val: any,
  options?: {
    i18nKey?: string;
    validationOptions?: ValidationOptions;
  },
) {
  return (object: object, propertyName: string) => {
    return registerDecorator({
      name: 'isEnumX',
      target: object.constructor,
      propertyName,
      constraints: [val],
      options: {
        ...options?.validationOptions,
        message(args) {
          let values = '';
          const {
            property,
            constraints: [item],
          } = args;

          const i18n = I18nContext.current()!;
          if (Array.isArray(item)) {
            values = item.join(',');
          } else {
            values = Object.values(<object>item)
              .map((f) =>
                i18n.t(
                  options?.i18nKey
                    ? `property.${options?.i18nKey}.${f}`
                    : `property.${property}_enum.${f}`,
                ),
              )
              .join(', ');
          }

          return i18n.t('validation.isEnumX', {
            args: { property: i18n.t(`property.${property}`), values },
          });
        },
      },
      validator: {
        validate(value: string, args: ValidationArguments) {
          const item = args.constraints[0];
          if (Array.isArray(item)) {
            return item.includes(value);
          }

          return Object.values(<object>item).includes(value);
        },
      },
    });
  };
}
