<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posyandus', function (Blueprint $table) {
            $table->string('ketua_name')->nullable()->after('dusun');
            $table->string('no_hp_ketua', 20)->nullable()->after('ketua_name');
            $table->text('deskripsi')->nullable()->after('no_hp_ketua');
        });
    }

    public function down(): void
    {
        Schema::table('posyandus', function (Blueprint $table) {
            $table->dropColumn(['ketua_name', 'no_hp_ketua', 'deskripsi']);
        });
    }
};
