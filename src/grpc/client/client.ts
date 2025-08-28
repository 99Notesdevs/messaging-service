import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const grpcHost = process.env.GRPC_HOST || "localhost";
const grpcPort = process.env.GRPC_PORT || 50051;
const address = `${grpcHost}:${grpcPort}`;

const AUTH_PROTO_PATH = path.join(__dirname, "../proto/auth.proto");
const USER_PROTO_PATH = path.join(__dirname, "../proto/user.proto");

const authPackageDefinition = protoLoader.loadSync(AUTH_PROTO_PATH);
const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH);

const authProto = grpc.loadPackageDefinition(authPackageDefinition)
  .Authenticate as any;
const userProto = grpc.loadPackageDefinition(userPackageDefinition).User as any;

const authClient = new authProto.AuthService(
  address,
  grpc.credentials.createInsecure()
);
const userClient = new userProto.UserService(
  address,
  grpc.credentials.createInsecure()
);

export const getAuthToken = async (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    authClient.GetAuthToken({ token }, (error: any, response: any) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

export const getUserRating = async (
  userId: number
): Promise<{ rating: number }> => {
  return new Promise((resolve, reject) => {
    userClient.GetUserRating({ userId }, (error: any, response: any) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

export const updateUserRating = async (
  userId: number,
  rating: number
): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    userClient.UpdateUserRating(
      { userId, rating },
      (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      }
    );
  });
};
