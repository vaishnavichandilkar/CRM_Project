import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { DealersModule } from './modules/dealers/dealers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { TransportersModule } from './modules/transporters/transporters.module';
import { VetDocsModule } from './modules/vet-docs/vet-docs.module';
import { SHGModule } from './modules/shg/shg.module';
import { ContentPlansModule } from './modules/content-plans/content-plans.module';
import { PromotionDesignsModule } from './modules/promotion-designs/promotion-designs.module';
import { RolesModule } from './modules/roles/roles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TeamModule } from './modules/team/team.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { MastersModule } from './modules/masters/masters.module';
import { AppsModule } from './modules/apps/apps.module';
import { AppStoreModule } from './modules/app-store/app-store.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { UserModulePreferencesModule } from './modules/user-module-preferences/user-module-preferences.module';
import { CustomModulesModule } from './modules/custom-modules/custom-modules.module';
import { LeadsModule } from './modules/leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    DealersModule,
    SuppliersModule,
    TransportersModule,
    VetDocsModule,
    SHGModule,
    ContentPlansModule,
    PromotionDesignsModule,
    RolesModule,
    CustomersModule,
    TeamModule,
    MastersModule,
    AppsModule,
    AppStoreModule,
    UserPreferencesModule,
    UserModulePreferencesModule,
    CustomModulesModule,
    LeadsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
