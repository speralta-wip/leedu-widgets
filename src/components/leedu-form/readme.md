# configurable-form-bckup



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type                   | Default          |
| ---------- | ---------- | ----------- | ---------------------- | ---------------- |
| `config`   | `config`   |             | `FormConfig \| string` | `{ fields: [] }` |
| `disabled` | `disabled` |             | `boolean`              | `false`          |


## Events

| Event         | Description | Type                                                           |
| ------------- | ----------- | -------------------------------------------------------------- |
| `fieldChange` |             | `CustomEvent<{ fieldId: string; value: any; formData: any; }>` |
| `formReset`   |             | `CustomEvent<void>`                                            |
| `formSubmit`  |             | `CustomEvent<{ data: any; isValid: boolean; }>`                |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
