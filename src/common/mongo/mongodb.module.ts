import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_PROVIDER, MONGODB_URI_ENV_KEY } from '@/lib/constant';

@Global()
@Module({
  providers: [
    {
      provide: MONGODB_PROVIDER,
      async useFactory(configService: ConfigService) {
        const client = new MongoClient(
          configService.get<string>(MONGODB_URI_ENV_KEY)!,
          {
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
            },
          },
        );

        await client.connect();

        return client.db(process.env.MONGODB_DB);
      },
      inject: [ConfigService],
    },
  ],
  exports: [MONGODB_PROVIDER],
})
export class MongoDbModule {}
