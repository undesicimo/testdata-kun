## Test Data-kun

Your friendly neighborhood Test Data generator

## Chat Participant

For example, if you have the following types,

```typescript
type Address = {
  street: string;
  city: string;
  zipCode: string;
};

type Person = {
  name: string;
  age: number;
  address: Address;
};
```

You can call `@testdata-kun` from with the type information. `testdata-kun` will give you the dummy data that corresponds with the type declaration!
It even asks for other necessary type information for a more accurate data generation.

![alt text](/images/image2.png)

## Dynamic type generation command

![alt text](/images/image3.png)
Just highlight the type variable, and activate `Generate dummy data` from the command pallete.
![alt text](/images/image4.png)
And voila! Dummy data will be added to your clipboard automaticaly

```ts
const data: Person = {
  name: "John Doe",
  age: 25,
  address: {
    street: "123 Main Street",
    city: "New York",
    zipCode: "10001",
  },
};
```

---
