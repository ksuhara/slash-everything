import AdminAuthGuard from "@/components/AdminAuthGuard";
import { Header } from "@/components/Header";
import initializeFirebaseClient from "@/configs/initFirebase";
import { statusToColor } from "@/configs/status";
import { formatDate } from "@/lib/date";
import {
  Container,
  IconButton,
  Link,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { FaAmazon } from "react-icons/fa";

export default function Success() {
  const router = useRouter();
  const { db } = initializeFirebaseClient();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (querySnapshot) => {
        const documents: SetStateAction<any[]> = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        setOrders(documents);
      }
    );

    return () => unsubscribe();
  }, [db]);

  const handleSelectChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status,
      });
      console.log("Updated role successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <AdminAuthGuard>
        <Container maxW="container.xl" mt="24" px="16">
          <>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Amount</Th>
                    <Th>Order Code</Th>
                    <Th>List</Th>
                    <Th>Adddress</Th>
                    <Th>Created At</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orders.map((order) => {
                    return (
                      <Tr key={order.id}>
                        <Td>
                          <Text fontWeight="medium">
                            {order.amount} {order.amountType}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontWeight="medium">{order.orderCode}</Text>
                        </Td>
                        <Td>
                          <Link href={order.requestUrl} target="_blank">
                            <IconButton
                              colorScheme="gray"
                              size="sm"
                              icon={<FaAmazon fontSize="1.25rem" />}
                              aria-label="Amazon"
                            />
                          </Link>
                        </Td>
                        <Td>
                          <Link
                            href={`https://etherscan.io/address/${order.user}`}
                            target="_blank"
                          >
                            <Text fontWeight="medium" color="blue.400">
                              {order.user.substring(0, 10) + "..."}
                            </Text>
                          </Link>
                        </Td>
                        <Td>
                          {order.createdAt ? formatDate(order.createdAt) : ""}
                        </Td>
                        <Td>
                          <Select
                            value={order.status}
                            onChange={(event) =>
                              handleSelectChange(order.id, event.target.value)
                            }
                            bg={`${statusToColor[order.status]}.100`}
                          >
                            <option value="initiated" disabled>
                              未決済
                            </option>
                            <option value="processing">決済完了</option>
                            <option value="failed">決済完了</option>
                            <option value="completed">プレゼント完了</option>
                            <option value="action_required">
                              ユーザー対応中
                            </option>
                          </Select>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </>
        </Container>
      </AdminAuthGuard>
    </>
  );
}
