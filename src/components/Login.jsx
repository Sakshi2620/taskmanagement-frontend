import { useMemo, useState } from "react";
import { login, register } from "../api/tasks";

function Login({ onLogin, darkMode, setDarkMode }) {
  const [registerMode, setRegisterMode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName:"",
    email:"",
    username:"",
    password:"",
    confirmPassword:"",
  });

  const valid = useMemo(() => {
    if (!form.username || !form.password) return false;

    if (registerMode) {
      return (
        form.fullName.length > 2 &&
        form.email &&
        form.password.length >= 8 &&
        form.password === form.confirmPassword
      );
    }

    return true;
  }, [form, registerMode]);

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark":"light");
  };

  const submit = async(e)=>{
    e.preventDefault();

    if(!valid) return;

    try{
      setLoading(true);
      setError("");

      if(registerMode){
        const names=form.fullName.split(" ");

        await register({
          first_name:names[0],
          last_name:names.slice(1).join(" ") || "",
          email:form.email,
          username:form.username,
          password:form.password,
          password_confirm:form.confirmPassword
        });

        alert("Registered Successfully");
        setRegisterMode(false);
        return;
      }

      const res = await login({
        username:form.username,
        password:form.password
      });

      onLogin(res.user,res.token);

    }catch(err){
      console.log(err.response?.data);

      if(typeof err.response?.data === "object"){
        const firstError=Object.values(err.response.data)[0];
        setError(
          Array.isArray(firstError)
          ? firstError[0]
          : firstError
        );
      }else{
        setError("Authentication failed");
      }

    }finally{
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...styles.page,
        background:darkMode
        ? "#111827"
        : "linear-gradient(135deg,#667eea,#764ba2)"
      }}
    >
      <div
        style={{
          ...styles.card,
          background:darkMode ? "#1f2937":"white",
          color:darkMode ? "white":"#111827"
        }}
      >

        <button
          onClick={toggleTheme}
          style={styles.themeBtn}
        >
          {darkMode ? "☀️":"🌙"}
        </button>

        <h1 style={{marginBottom:8}}>
          TaskFlow
        </h1>

        <p>
          {registerMode
            ? "Create your account"
            : "Login to continue"}
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={styles.form}>

          {registerMode && (
            <>
              <input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />
            </>
          )}

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={{position:"relative"}}>
            <input
              name="password"
              type={showPass ? "text":"password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />

            <button
              type="button"
              onClick={()=>setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              {showPass ? "🙈":"👁️"}
            </button>
          </div>

          {registerMode && (
            <>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={styles.input}
              />

              <div style={styles.rules}>
                <span>
                  {form.password.length>=8 ? "✓":"○"} 8 chars
                </span>

                <span>
                  {/[A-Z]/.test(form.password) ? "✓":"○"} Uppercase
                </span>

                <span>
                  {/[0-9]/.test(form.password) ? "✓":"○"} Number
                </span>
              </div>
            </>
          )}

          <button
            disabled={!valid || loading}
            style={styles.submit}
          >
            {
              loading
              ? "Please wait..."
              : registerMode
              ? "Create Account"
              : "Login"
            }
          </button>

          <p style={{textAlign:"center"}}>
            {registerMode
              ? "Already have account?"
              : "New user?"
            }

            <button
              type="button"
              onClick={()=>setRegisterMode(!registerMode)}
              style={styles.switchBtn}
            >
              {registerMode
                ? " Login"
                : " Register"}
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}

const styles={
page:{
 minHeight:"100vh",
 display:"flex",
 justifyContent:"center",
 alignItems:"center",
 padding:20
},

card:{
 width:"100%",
 maxWidth:430,
 padding:35,
 borderRadius:22,
 position:"relative",
 boxShadow:"0 20px 50px rgba(0,0,0,.18)"
},

themeBtn:{
 position:"absolute",
 top:20,
 right:20,
 border:"none",
 background:"transparent",
 fontSize:22,
 cursor:"pointer"
},

form:{
 display:"flex",
 flexDirection:"column",
 gap:14
},

input:{
 padding:12,
 borderRadius:10,
 border:"1px solid #ddd",
 width:"100%"
},

eyeBtn:{
 position:"absolute",
 right:12,
 top:12,
 border:"none",
 background:"none",
 cursor:"pointer"
},

rules:{
 display:"flex",
 gap:10,
 fontSize:12,
 flexWrap:"wrap"
},

submit:{
 padding:13,
 border:"none",
 borderRadius:10,
 background:"#6366f1",
 color:"white",
 fontWeight:700
},

switchBtn:{
 border:"none",
 background:"none",
 color:"#6366f1",
 fontWeight:700,
 cursor:"pointer"
},

error:{
 background:"#fef2f2",
 color:"#dc2626",
 padding:10,
 borderRadius:10
}
};

export default Login;