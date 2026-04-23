export const contectFormData = {
  field: (editId, data) => [
    {
      type: "text",
      name: "name",
      value: editId !== null ? data.name : "",
      placeholder: "Enter Your Name",
      required: true,
    },
    {
      type: "text",
      name: "phoneNumber",
      placeholder: "Enter Your Number",
      value: editId !== null ? data.phoneNumber : "",
      required: true,
    },
  ],
  buttons: (handleCancle, editId) => [
    {
      type: "button",
      variant: "outline",
      label: "Cancel",
      onClick: handleCancle,
    },
    {
      type: "submit",
      variant: "primary",
      label: editId !== null ? "Update Contact" : "Add Contact",
    },
  ],
};

export const messageTempleteFormData = {
  field: (editId, data) => [
    {
      type: "text",
      name: "title",
      placeholder: "Enter Your Title",
      value: editId !== null ? data.title : "",
      required: true,
    },
    {
      type: "textarea",
      row: 4,
      name: "message",
      placeholder: "Enter Your Messsage",
      value: editId !== null ? data.message : "",
      required: true,
    },
  ],
  buttons: (handleCancle, editId) => [
    {
      type: "button",
      variant: "outline",
      label: "Cancel",
      onClick: handleCancle,
    },
    {
      type: "submit",
      variant: "primary",
      label: editId !== null ? "Update Template" : "Add Template",
    },
  ],
};