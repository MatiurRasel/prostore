import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: 'Update User',
}

const AdminUserUpdatePage = async() => {
    // Optionally, redirect to /admin/users
    redirect('/admin/users');
    // If you want to show a message instead, comment out the above line and uncomment below:
    // return (
    //   <div className="max-w-lg mx-auto py-10">
    //     <h1 className="h2-bold mb-4">User Edit</h1>
    //     <p>User editing is now handled inline in the users table.</p>
    //   </div>
    // );
}

export default AdminUserUpdatePage;