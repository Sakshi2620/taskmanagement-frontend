import { useState, useEffect } from "react";

const initialForm = {
  title:"",
  description:"",
  priority:"medium",
  category:"personal",
  status:"todo",
  due_date:"",
  notes:"",
  recurrence:"none"
};

function TaskForm({
  onSave,
  editingTask,
  onCancel
}) {

const [form,setForm]=useState(initialForm);
const [loading,setLoading]=useState(false);

useEffect(()=>{
 if(editingTask){
   setForm({
     ...initialForm,
     ...editingTask
   });
 }else{
   setForm(initialForm);
 }
},[editingTask]);


const handleChange=(e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};


const submit=async(e)=>{
e.preventDefault();

if(!form.title.trim()) return;

try{
setLoading(true);

await onSave(form);

if(!editingTask){
 setForm(initialForm);
}

}catch(err){
console.error(err);
}
finally{
setLoading(false);
}
};


return(
<div style={styles.card}>

<h2>
{editingTask
? "✏ Edit Task"
: "➕ Create Task"}
</h2>

<form
onSubmit={submit}
style={styles.form}
>

<input
name="title"
value={form.title}
onChange={handleChange}
placeholder="Task title"
style={styles.input}
/>


<textarea
name="description"
value={form.description}
onChange={handleChange}
placeholder="Description"
style={styles.textarea}
/>


<div style={styles.row}>

<select
name="priority"
value={form.priority}
onChange={handleChange}
style={styles.input}
>
<option value="high">
🔴 High
</option>

<option value="medium">
🟡 Medium
</option>

<option value="low">
🟢 Low
</option>

</select>


<select
name="category"
value={form.category}
onChange={handleChange}
style={styles.input}
>

<option value="work">
💼 Work
</option>

<option value="personal">
🏠 Personal
</option>

<option value="shopping">
🛒 Shopping
</option>

<option value="health">
❤️ Health
</option>

<option value="finance">
💰 Finance
</option>

<option value="other">
📌 Other
</option>

</select>

</div>


<select
name="status"
value={form.status}
onChange={handleChange}
style={styles.input}
>
<option value="todo">
To Do
</option>

<option value="in_progress">
In Progress
</option>

<option value="done">
Done
</option>

</select>


<input
type="date"
name="due_date"
value={form.due_date || ""}
onChange={handleChange}
style={styles.input}
/>


<textarea
name="notes"
value={form.notes}
onChange={handleChange}
placeholder="Notes"
style={styles.textarea}
/>


<select
name="recurrence"
value={form.recurrence}
onChange={handleChange}
style={styles.input}
>

<option value="none">
No Repeat
</option>

<option value="daily">
Daily
</option>

<option value="weekly">
Weekly
</option>

<option value="monthly">
Monthly
</option>

</select>


<div style={styles.actions}>

<button
type="submit"
style={styles.saveBtn}
disabled={loading}
>
{loading
? "Saving..."
: editingTask
? "Update Task"
: "Save Task"}
</button>


{editingTask && (
<button
type="button"
onClick={onCancel}
style={styles.cancelBtn}
>
Cancel
</button>
)}

</div>

</form>
</div>
)
}


const styles={

card:{
background:"white",
padding:24,
borderRadius:18,
boxShadow:"0 8px 20px rgba(0,0,0,.08)"
},

form:{
display:"flex",
flexDirection:"column",
gap:14
},

row:{
display:"flex",
gap:12
},

input:{
padding:12,
borderRadius:10,
border:"1px solid #ddd",
flex:1
},

textarea:{
padding:12,
minHeight:90,
borderRadius:10,
border:"1px solid #ddd"
},

actions:{
display:"flex",
gap:10
},

saveBtn:{
background:"#6366f1",
color:"white",
border:"none",
padding:"12px 18px",
borderRadius:10,
cursor:"pointer"
},

cancelBtn:{
padding:"12px 18px",
borderRadius:10,
border:"none",
cursor:"pointer"
}

};

export default TaskForm;