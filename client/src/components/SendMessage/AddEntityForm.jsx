import FormField from "../Forms/FormField";

function AddEntityForm({
  handleSubmit,
  editEntityId,
  handleCancle,
  formDataFields,
  formDataButtons,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className=" w-[90%] max-w-md rounded-2xl border shadow-2xl bg-(--bg-primary) border-(--border) text-(--text-primary)">
        <FormField
          header={`${editEntityId ? "Update" : "Add"}`}
          fields={formDataFields}
          onSubmit={handleSubmit}
          buttons={formDataButtons(handleCancle, editEntityId)}
        />
      </div>
    </div>
  );
}

export default AddEntityForm;
