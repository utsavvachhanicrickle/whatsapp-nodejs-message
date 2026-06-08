export const defaultKeywordsReplayeFormData = {
  field: (editId, data) => [
    {
      type: "text",
      name: "defaultKeyword",
      placeholder: "Enter Your Default Keyword",
      value: editId !== null ? data.defaultkeyword : "",
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
      label: editId !== null ? "Update KeyWords" : "Add KeyWords",
    },
  ],
};

export const defaultKeywordsMessageFormData = {
  field: (editId, data) => [
    {
      type: "textarea",
      name: "defaulWordsMessages",
      placeholder: "Enter Your Default Keyword Message",
      value: editId !== null ? data.defaulwordsmessages : "",
      required: true,
      row: 6,
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
      label:
        editId !== null ? "Update Message" : "Add Message",
    },
  ],
};
