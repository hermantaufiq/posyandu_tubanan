<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->foreignId('antrian_id')->nullable()->constrained('antrians')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->dropForeign(['antrian_id']);
            $table->dropColumn('antrian_id');
        });
    }
};
