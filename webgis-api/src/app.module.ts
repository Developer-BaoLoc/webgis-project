import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WardsModule } from './wards/wards.module';
import { RoadsModule } from './roads/roads.module';
import { RiversModule } from './rivers/rivers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tobaoloc5a4gmail.com',
      database: 'webgis',
      synchronize: false,
      autoLoadEntities: true,
    }),
    WardsModule,
    RoadsModule,
    RiversModule,
  ],
})
export class AppModule {}