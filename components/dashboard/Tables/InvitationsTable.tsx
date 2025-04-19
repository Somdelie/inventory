"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { format } from "date-fns";

// Type based on your Prisma model
export type Invitation = {
  id: string;
  email: string;
  status: boolean;
  createdAt: Date;
};

interface InvitationsTableProps {
  invitations: Invitation[];
  isLoading?: boolean;
}

export function InvitationsTable({
  invitations,
  isLoading = false,
}: InvitationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [invites, setInvites] = useState<Invitation[]>(invitations);

  // Filter invitations based on search query
  const filteredInvitations = invitations.filter((invitation) =>
    invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-rose-200 focus:border-rose-500 focus:ring-rose-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <div className="rounded-md border border-rose-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-rose-50">
              <TableRow>
                <TableHead className="font-semibold ">Email</TableHead>
                <TableHead className="font-semibold ">Status</TableHead>
                <TableHead className="font-semibold ">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitations.length > 0 ? (
                filteredInvitations.map((invitation) => (
                  <TableRow key={invitation.id} className="hover:bg-rose-50">
                    <TableCell className="font-medium">
                      {invitation.email}
                    </TableCell>
                    <TableCell>
                      {invitation.status ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Success
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(invitation.createdAt, "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "No invitations found matching your search"
                      : "No invitations found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
