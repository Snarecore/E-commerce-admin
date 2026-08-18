// ===== Helpers & Table Component =====
type CommentUser = {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    profileImage?: string;
  };
  
  type CommentNode = {
    id: string;
    body?: string;        // sometimes API uses body
    comment?: string;     // sometimes API uses comment
    createdAt?: string;
    user?: CommentUser;
    replies?: CommentNode[];
    replyCount?: number;
  };
  
  const getBody = (n?: CommentNode | null) => (n?.comment ?? n?.body ?? "—").toString();
  
  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  };
  
  // Flatten replies with depth for indent styling
  const collectReplies = (nodes: CommentNode[] = [], depth = 1): Array<{ node: CommentNode; depth: number }> => {
    const out: Array<{ node: CommentNode; depth: number }> = [];
    for (const n of nodes) {
      out.push({ node: n, depth });
      if (n.replies && n.replies.length) {
        out.push(...collectReplies(n.replies, depth + 1));
      }
    }
    return out;
  };
  
 export function CommentThreadTable({ review }: { review: CommentNode }) {
    const rows = [{ node: review, depth: 0 }, ...collectReplies(review.replies ?? [], 1)];
  
    return (
      <div className="mt-2 w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr className="text-gray-700 text-sm">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map(({ node, depth }) => (
              <tr key={node.id} className="align-top">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {depth === 0 ? "Comment" : `Reply`}
                </td>
  
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    {node.user?.profileImage ? (
                      <img
                        src={node.user.profileImage}
                        alt={node.user?.name ?? "User"}
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                    ) : null}
                    <div className="text-sm">
                      <div className="font-medium">{node.user?.name ?? "—"}</div>
                      <div className="text-gray-500">{node.user?.email ?? ""}</div>
                    </div>
                  </div>
                </td>
  
                <td className="px-4 py-3">
                  {/* indent replies visually based on depth */}
                  <div
                    className="text-sm whitespace-pre-wrap break-words"
                    style={{ paddingLeft: depth * 16 }} // 16px per level
                  >
                    {getBody(node)}
                  </div>
                </td>
  
                <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(node.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  