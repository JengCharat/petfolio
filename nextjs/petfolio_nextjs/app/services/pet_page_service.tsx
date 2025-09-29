export const addPetService = async (form: any, token: string, userId: string) => {
  const newPet = {
    ...form,
    type: form.type,
    weight: form.weight || "",
    ownerId: userId,
  };

  const res = await fetch("http://localhost:3002/api/pets", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newPet),
  });

  if (!res.ok) throw new Error("Failed to add pet");
  return await res.json(); // คืนค่าข้อมูลที่ backend ส่งกลับมา
};
