import { getOrgApiKeys } from "@/actions/api-keys";
import { CreateKeyDialog } from "@/components/dashboard/integrations/create-key-dialog";
import { KeyRow } from "@/components/dashboard/integrations/key-row";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import EmptyState from "@/components/global/EmptyState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { Shield } from "lucide-react";

export default async function ApiKeysPage() {
  const user = await getAuthenticatedUser();
  const organizationId = user?.organizationId;
  const keysResponse = await getOrgApiKeys(organizationId ?? "");

  // Check if the response is an array (successful response) or an error object
  const isArray = Array.isArray(keysResponse);
  const keys = isArray ? keysResponse : [];
  const error = !isArray ? (keysResponse as { error: string }).error : null;

  return (
    <Card className="w-full">
      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="mt-2 float-end">
            <CreateKeyDialog />
          </div>
          <EmptyState
            message="No categories found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first brand to get started with inventory management."
          />
        </div>
      ) : (
        <>
          {" "}
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="">
                {" "}
                <CardTitle className="text-xl font-semibold flex">
                  <Shield className="text-primary" /> API Keys
                </CardTitle>
                <CardDescription>
                  Manage your API keys for authentication and access control.
                </CardDescription>
              </div>
              <CreateKeyDialog />
            </div>
            <hr className="border-b border-gray-200" />
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-md">
                {error}
              </div>
            )}
            <>
              <div className="">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-medium text-gray-500">
                        Name
                      </th>
                      <th className="text-left py-3 font-medium text-gray-500">
                        Key
                      </th>
                      <th className="text-left py-3 font-medium text-gray-500">
                        Created
                      </th>
                      <th className="text-left py-3 font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <KeyRow
                        key={key.id}
                        apiKey={{
                          id: key.id,
                          name: key.name,
                          key: key.key,
                          created: key.createdAt.toLocaleString(),
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          </CardContent>
        </>
      )}
    </Card>
  );
}
