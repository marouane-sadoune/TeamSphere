import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "TeamSphere" });

const syncUserCreation = inngest.createFunction( 
    { id: "sync-user-with-clerk", triggers: { event: "clerk/user.created" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            },
        });
        console.log("User created with ID:", data.id);
    }
);

const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk", triggers: { event: "clerk/user.deleted" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.delete({
            where: {
                id: data.id,
            },
        });
        console.log("User deleted with ID:", data.id);
    }
);

const syncUserUpdate = inngest.createFunction(
    { id: "update-user-with-clerk", triggers: { event: "clerk/user.updated" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.update({
            where: {
                id: data.id,
            },
            data: {
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            },
        });
        console.log("User updated with ID:", data.id);
    }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdate];