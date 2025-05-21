import * as yup from "yup";

export const taskSchema = yup.object({
  title: yup.string().required("Título é obrigatório"),
  description: yup.string().required("Descrição é obrigatória"),
  responsible_name: yup.string().required("Responsável é obrigatório"),
  status: yup.string().required("Status é obrigatório"),
  priority: yup.string().required("Prioridade é obrigatória"),
  due_date: yup
    .date()
    .typeError("Data inválida")
    .required("Data é obrigatória"),
  category: yup
    .number()
    .typeError("Categoria é obrigatória")
    .required("Categoria é obrigatória")
    .min(1, "Selecione uma categoria válida"),
});
