import { FormField } from "./FormField";

interface FieldProps {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  description?: string;
}

interface Props {
  fields: FieldProps[];
  form: {
    register: any;
    formState: { errors: any };
  };
}

export const FormBuilder = ({ fields, form }: Props) => {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type={field.type}
          description={field.description}
          registration={form.register(field.name)}
          error={form.formState.errors[field.name]}
        />
      ))}
    </div>
  );
};
