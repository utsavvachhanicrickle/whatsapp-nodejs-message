import FormField from "../Forms/FormField";

function AddEntityForm({
  handleSubmit,
  editEntityId,
  handleCancle,
  formDataFields,
  formDataButtons,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-(--bg-pop) p-6 rounded-lg w-[90%] max-w-md shadow-lg">
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
