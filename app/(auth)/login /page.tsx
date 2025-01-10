


export default function LoginPage () {

    return (
        <div>
        <h1>Login</h1>
        <p>Sign in with your email and password.</p>
        <form>
            <label>
            Email
            <input type="email" name="email" />
            </label>
            <label>
            Password
            <input type="password" name="password" />
            </label>
            <button type="submit">Sign in</button>
        </form>
        </div>
    )
}