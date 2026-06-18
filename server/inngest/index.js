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
        
    }
);

//  inngest functions to save workspace data to the database when a user is created, updated or deleted in Clerk
const syncWorkspaceCreation = inngest.createFunction(
    { id: "sync-workspace-from-clerk", triggers: { event: "clerk/organization.created" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                img: data.image_url,
            },
        });
        // add creator as Admin to the workspace
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN",
            },
        });
    }
);

// inngest function to update workspace data in the database 
const syncWorkspaceUpdate = inngest.createFunction(
    { id: "update-workspace-from-clerk", triggers: { event: "clerk/organization.updated" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                slug: data.slug,
                img: data.image_url,
            },
        });
    }
);
// inngest function to delete workspace data from the database when a workspace is deleted in Clerk
const syncWorkspaceDeletion = inngest.createFunction(
    { id: "delete-workspace-from-clerk", triggers: { event: "clerk/organization.deleted" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.delete({
            where: {
                id: data.id,
            },
        });
    }
);
// inngest function to save workspace member data to the database when a user is added to a workspace in Clerk
const syncWorkspaceMemberCreation = inngest.createFunction(
    { id: "add-workspace-member-from-clerk", triggers: { event: "clerk/organization.member.created" } },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspaceMember.create({
            data: {
                userId: data.user_id,
                workspaceId: data.organization_id,
                role: data.role,
            },
        });
    }
);
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdate, syncWorkspaceCreation, syncWorkspaceUpdate, syncWorkspaceDeletion, syncWorkspaceMemberCreation];